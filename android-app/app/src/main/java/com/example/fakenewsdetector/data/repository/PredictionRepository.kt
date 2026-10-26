package com.example.fakenewsdetector.data.repository

import com.example.fakenewsdetector.data.local.PredictionDao
import com.example.fakenewsdetector.data.local.PredictionEntity
import com.example.fakenewsdetector.data.remote.*
import kotlinx.coroutines.flow.Flow
import java.net.SocketTimeoutException
import java.net.UnknownHostException

class PredictionRepository(private val predictionDao: PredictionDao) {

    val allPredictions: Flow<List<PredictionEntity>> = predictionDao.getAllPredictions()
    val fakePredictions: Flow<List<PredictionEntity>> = predictionDao.getFakePredictions()
    val realPredictions: Flow<List<PredictionEntity>> = predictionDao.getRealPredictions()

    val totalCount: Flow<Int> = predictionDao.getTotalCount()
    val fakeCount: Flow<Int> = predictionDao.getFakeCount()
    val realCount: Flow<Int> = predictionDao.getRealCount()

    suspend fun analyzeNews(
        title: String,
        text: String,
        url: String?,
        baseUrl: String,
        isDemoMode: Boolean
    ): Result<PredictionResponse> {
        if (isDemoMode) {
            // Simulated local demo mode
            return Result.success(generateDemoPrediction(title, text))
        }

        return try {
            val service = ApiClient.getService(baseUrl)
            val request = PredictionRequest(title = title, text = text, url = url)
            val response = service.predictNews(request)

            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Server returned error status code: ${response.code()}"
                Result.failure(Exception("API Error (${response.code()}): $errorMsg"))
            }
        } catch (e: UnknownHostException) {
            Result.failure(Exception("Cannot connect to server. Please check internet connection or backend URL ($baseUrl). Enable Demo Mode in Settings to test offline."))
        } catch (e: SocketTimeoutException) {
            Result.failure(Exception("Server connection timed out ($baseUrl). Please verify server is running."))
        } catch (e: Exception) {
            Result.failure(Exception("Network error: ${e.localizedMessage ?: e.message}"))
        }
    }

    suspend fun savePredictionToHistory(response: PredictionResponse, title: String, text: String): Long {
        val entity = PredictionEntity(
            title = if (title.isNotBlank()) title else "Analyzed Article",
            text = text,
            prediction = response.prediction,
            confidence = response.confidence,
            fakeProbability = response.fakeProbability,
            realProbability = response.realProbability,
            riskLevel = response.riskLevel,
            importantFeatures = response.importantFeatures.joinToString(","),
            isDemo = response.isDemo
        )
        return predictionDao.insertPrediction(entity)
    }

    suspend fun deletePrediction(id: Long) {
        predictionDao.deletePredictionById(id)
    }

    suspend fun clearHistory() {
        predictionDao.clearAllPredictions()
    }

    suspend fun fetchModelInfo(baseUrl: String): Result<ModelInfoResponse> {
        return try {
            val service = ApiClient.getService(baseUrl)
            val response = service.getModelInfo()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Model info unavailable from server."))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Offline: Could not connect to backend ($baseUrl)"))
        }
    }

    private fun generateDemoPrediction(title: String, text: String): PredictionResponse {
        val combined = "$title $text".lowercase()
        val fakeKeywords = listOf("shocking", "secret", "miracle", "unbelievable", "breaking", "cures", "exposed", "conspiracy", "banned")
        val matched = fakeKeywords.filter { combined.contains(it) }

        val isFake = matched.isNotEmpty() || combined.contains("alien") || combined.contains("glitch")
        val fakeProb = if (isFake) 0.88 else 0.12
        val realProb = 1.0 - fakeProb
        val conf = if (isFake) fakeProb else realProb
        val risk = if (isFake) "HIGH" else "LOW"
        val features = if (matched.isNotEmpty()) matched.take(5) else listOf("sample", "demo", "headline")

        return PredictionResponse(
            prediction = if (isFake) "FAKE" else "REAL",
            confidence = conf,
            fakeProbability = fakeProb,
            realProbability = realProb,
            riskLevel = risk,
            importantFeatures = features,
            disclaimer = "DEMO MODE – Predictions are simulated locally. Enable Real ML API in Settings to connect to Python backend.",
            isDemo = true
        )
    }
}
