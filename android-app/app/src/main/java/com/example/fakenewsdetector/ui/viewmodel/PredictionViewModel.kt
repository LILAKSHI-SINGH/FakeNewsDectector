package com.example.fakenewsdetector.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.fakenewsdetector.FakeNewsApplication
import com.example.fakenewsdetector.data.local.PredictionEntity
import com.example.fakenewsdetector.data.remote.ApiClient
import com.example.fakenewsdetector.data.remote.ModelInfoResponse
import com.example.fakenewsdetector.data.remote.PredictionResponse
import com.example.fakenewsdetector.data.repository.PredictionRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

sealed class AnalysisUiState {
    object Idle : AnalysisUiState()
    object Loading : AnalysisUiState()
    data class Success(val response: PredictionResponse) : AnalysisUiState()
    data class Error(val message: String) : AnalysisUiState()
}

enum class HistoryFilter { ALL, REAL, FAKE }

class PredictionViewModel(
    application: Application,
    private val repository: PredictionRepository
) : AndroidViewModel(application) {

    // Form inputs
    val headlineText = MutableStateFlow("")
    val bodyText = MutableStateFlow("")
    val urlText = MutableStateFlow("")

    // Settings state
    val isDemoMode = MutableStateFlow(false)
    val baseUrl = MutableStateFlow(ApiClient.DEFAULT_BASE_URL)
    val isDarkMode = MutableStateFlow(true)

    // UI State for analysis
    private val _uiState = MutableStateFlow<AnalysisUiState>(AnalysisUiState.Idle)
    val uiState: StateFlow<AnalysisUiState> = _uiState.asStateFlow()

    // Last Prediction Result (for ResultScreen)
    val currentResult = MutableStateFlow<PredictionResponse?>(null)
    val currentTitle = MutableStateFlow("")
    val currentText = MutableStateFlow("")

    // History filter
    val historyFilter = MutableStateFlow(HistoryFilter.ALL)

    // History flow from Room
    val filteredHistory: StateFlow<List<PredictionEntity>> = historyFilter.flatMapLatest { filter ->
        when (filter) {
            HistoryFilter.ALL -> repository.allPredictions
            HistoryFilter.REAL -> repository.realPredictions
            HistoryFilter.FAKE -> repository.fakePredictions
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Database stats
    val totalCheckedCount: StateFlow<Int> = repository.totalCount.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)
    val fakeDetectedCount: StateFlow<Int> = repository.fakeCount.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)
    val realDetectedCount: StateFlow<Int> = repository.realCount.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    // Model Info State
    private val _modelInfoState = MutableStateFlow<ModelInfoResponse?>(null)
    val modelInfoState: StateFlow<ModelInfoResponse?> = _modelInfoState.asStateFlow()

    private val _modelInfoError = MutableStateFlow<String?>(null)
    val modelInfoError: StateFlow<String?> = _modelInfoError.asStateFlow()

    init {
        loadModelInformation()
    }

    fun analyzeNews() {
        val title = headlineText.value.trim()
        val text = bodyText.value.trim()
        val url = urlText.value.trim().ifEmpty { null }

        if (title.isEmpty() && text.isEmpty() && url == null) {
            _uiState.value = AnalysisUiState.Error("Please provide a news headline, article body, or valid news URL.")
            return
        }

        viewModelScope.launch {
            _uiState.value = AnalysisUiState.Loading

            val result = repository.analyzeNews(
                title = title,
                text = text,
                url = url,
                baseUrl = baseUrl.value,
                isDemoMode = isDemoMode.value
            )

            result.fold(
                onSuccess = { response ->
                    currentResult.value = response
                    currentTitle.value = title.ifEmpty { "Analyzed Article" }
                    currentText.value = text
                    _uiState.value = AnalysisUiState.Success(response)
                    
                    // Automatically save result to Room history
                    repository.savePredictionToHistory(response, currentTitle.value, currentText.value)
                },
                onFailure = { error ->
                    _uiState.value = AnalysisUiState.Error(error.message ?: "An unexpected error occurred during prediction.")
                }
            )
        }
    }

    fun clearForm() {
        headlineText.value = ""
        bodyText.value = ""
        urlText.value = ""
        _uiState.value = AnalysisUiState.Idle
    }

    fun deleteHistoryItem(id: Long) {
        viewModelScope.launch {
            repository.deletePrediction(id)
        }
    }

    fun clearAllHistory() {
        viewModelScope.launch {
            repository.clearHistory()
        }
    }

    fun loadModelInformation() {
        viewModelScope.launch {
            val result = repository.fetchModelInfo(baseUrl.value)
            result.fold(
                onSuccess = { info ->
                    _modelInfoState.value = info
                    _modelInfoError.value = null
                },
                onFailure = { err ->
                    _modelInfoError.value = err.message
                }
            )
        }
    }

    class Factory(private val application: Application) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
            val app = application as FakeNewsApplication
            return PredictionViewModel(application, app.repository) as T
        }
    }
}
