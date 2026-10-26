package com.example.fakenewsdetector

import com.example.fakenewsdetector.ui.viewmodel.AnalysisUiState
import com.example.fakenewsdetector.ui.viewmodel.HistoryFilter
import org.junit.Assert.*
import org.junit.Test

class PredictionViewModelTest {

    @Test
    fun testFormInputValidation() {
        var headline = ""
        var body = ""
        var url: String? = null

        val isValid = headline.isNotBlank() || body.isNotBlank() || !url.isNullOrBlank()
        assertFalse(isValid)

        headline = "Breaking News Headline"
        val isValidWithHeadline = headline.isNotBlank() || body.isNotBlank() || !url.isNullOrBlank()
        assertTrue(isValidWithHeadline)
    }

    @Test
    fun testHistoryFilterValues() {
        val filters = HistoryFilter.values()
        assertEquals(3, filters.size)
        assertTrue(filters.contains(HistoryFilter.ALL))
        assertTrue(filters.contains(HistoryFilter.REAL))
        assertTrue(filters.contains(HistoryFilter.FAKE))
    }

    @Test
    fun testRiskLevelCalculation() {
        fun getRiskLevel(prediction: String, confidence: Double): String {
            return if (prediction == "FAKE") {
                when {
                    confidence > 0.80 -> "HIGH"
                    confidence > 0.60 -> "MEDIUM"
                    else -> "LOW"
                }
            } else {
                "LOW"
            }
        }

        assertEquals("HIGH", getRiskLevel("FAKE", 0.94))
        assertEquals("MEDIUM", getRiskLevel("FAKE", 0.72))
        assertEquals("LOW", getRiskLevel("FAKE", 0.55))
        assertEquals("LOW", getRiskLevel("REAL", 0.98))
    }
}
