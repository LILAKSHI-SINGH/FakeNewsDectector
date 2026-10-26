package com.example.fakenewsdetector.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Splash : Screen("splash", "Splash")
    object Home : Screen("home", "Dashboard")
    object CheckNews : Screen("check_news", "Analyze News")
    object Result : Screen("result", "Analysis Result")
    object History : Screen("history", "Prediction History")
    object HowItWorks : Screen("how_it_works", "How It Works")
    object ModelInfo : Screen("model_info", "Model Information")
    object Settings : Screen("settings", "Settings & Info")
}
