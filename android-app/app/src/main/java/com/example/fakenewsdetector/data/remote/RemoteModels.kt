package com.example.fakenewsdetector.data.remote

import com.google.gson.annotations.SerializedName

data class PredictionRequest(
    @SerializedName("title") val title: String? = "",
    @SerializedName("text") val text: String? = "",
    @SerializedName("url") val url: String? = null
)

data class PredictionResponse(
    @SerializedName("prediction") val prediction: String,
    @SerializedName("confidence") val confidence: Double,
    @SerializedName("fake_probability") val fakeProbability: Double,
    @SerializedName("real_probability") val realProbability: Double,
    @SerializedName("risk_level") val riskLevel: String,
    @SerializedName("important_features") val importantFeatures: List<String> = emptyList(),
    @SerializedName("disclaimer") val disclaimer: String = "",
    @SerializedName("is_demo") val isDemo: Boolean = false
)

data class ModelInfoResponse(
    @SerializedName("model_trained") val modelTrained: Boolean,
    @SerializedName("best_model") val bestModel: String? = null,
    @SerializedName("dataset") val dataset: String? = null,
    @SerializedName("total_samples") val totalSamples: Int? = null,
    @SerializedName("training_samples") val trainingSamples: Int? = null,
    @SerializedName("testing_samples") val testingSamples: Int? = null,
    @SerializedName("accuracy") val accuracy: Double? = null,
    @SerializedName("precision") val precision: Double? = null,
    @SerializedName("recall") val recall: Double? = null,
    @SerializedName("f1_score") val f1Score: Double? = null,
    @SerializedName("confusion_matrix") val confusionMatrix: List<List<Int>>? = null,
    @SerializedName("model_comparison") val modelComparison: Map<String, ModelMetrics>? = null,
    @SerializedName("message") val message: String? = null
)

data class ModelMetrics(
    @SerializedName("accuracy") val accuracy: Double,
    @SerializedName("precision") val precision: Double,
    @SerializedName("recall") val recall: Double,
    @SerializedName("f1_score") val f1Score: Double,
    @SerializedName("confusion_matrix") val confusionMatrix: List<List<Int>>? = null
)

data class StatisticsResponse(
    @SerializedName("total_checked") val totalChecked: Int,
    @SerializedName("fake_detected") val fakeDetected: Int,
    @SerializedName("real_detected") val realDetected: Int
)
