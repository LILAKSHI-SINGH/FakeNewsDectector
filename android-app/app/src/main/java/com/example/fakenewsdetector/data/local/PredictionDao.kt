package com.example.fakenewsdetector.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface PredictionDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPrediction(prediction: PredictionEntity): Long

    @Query("SELECT * FROM predictions ORDER BY createdAt DESC")
    fun getAllPredictions(): Flow<List<PredictionEntity>>

    @Query("SELECT * FROM predictions WHERE prediction = 'FAKE' ORDER BY createdAt DESC")
    fun getFakePredictions(): Flow<List<PredictionEntity>>

    @Query("SELECT * FROM predictions WHERE prediction = 'REAL' ORDER BY createdAt DESC")
    fun getRealPredictions(): Flow<List<PredictionEntity>>

    @Query("SELECT COUNT(*) FROM predictions")
    fun getTotalCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM predictions WHERE prediction = 'FAKE'")
    fun getFakeCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM predictions WHERE prediction = 'REAL'")
    fun getRealCount(): Flow<Int>

    @Query("DELETE FROM predictions WHERE id = :id")
    suspend fun deletePredictionById(id: Long)

    @Query("DELETE FROM predictions")
    suspend fun clearAllPredictions()
}
