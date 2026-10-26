package com.example.fakenewsdetector.data.remote

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {

    @GET("health")
    suspend fun healthCheck(): Response<Map<String, Any>>

    @POST("predict")
    suspend fun predictNews(@Body request: PredictionRequest): Response<PredictionResponse>

    @GET("model-info")
    suspend fun getModelInfo(): Response<ModelInfoResponse>

    @GET("statistics")
    suspend fun getStatistics(): Response<StatisticsResponse>
}
