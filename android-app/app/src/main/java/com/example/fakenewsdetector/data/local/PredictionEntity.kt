package com.example.fakenewsdetector.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "predictions")
data class PredictionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val text: String,
    val prediction: String, // "FAKE" or "REAL"
    val confidence: Double,
    val fakeProbability: Double,
    val realProbability: Double,
    val riskLevel: String, // "HIGH", "MEDIUM", "LOW"
    val importantFeatures: String, // Comma-separated list of feature strings
    val isDemo: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
