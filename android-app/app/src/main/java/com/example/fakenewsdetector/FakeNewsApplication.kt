package com.example.fakenewsdetector

import android.app.Application
import com.example.fakenewsdetector.data.local.AppDatabase
import com.example.fakenewsdetector.data.repository.PredictionRepository

class FakeNewsApplication : Application() {

    val database by lazy { AppDatabase.getDatabase(this) }
    val repository by lazy { PredictionRepository(database.predictionDao()) }
}
