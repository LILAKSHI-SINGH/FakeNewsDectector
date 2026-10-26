package com.example.fakenewsdetector

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.fakenewsdetector.ui.navigation.Screen
import com.example.fakenewsdetector.ui.screens.*
import com.example.fakenewsdetector.ui.theme.FakeNewsDetectorTheme
import com.example.fakenewsdetector.ui.viewmodel.PredictionViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: PredictionViewModel by viewModels {
        PredictionViewModel.Factory(application)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            val isDarkMode by viewModel.isDarkMode.collectAsState()

            FakeNewsDetectorTheme(darkTheme = isDarkMode) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation(viewModel = viewModel)
                }
            }
        }
    }
}

@Composable
fun AppNavigation(viewModel: PredictionViewModel) {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Home.route) {
            HomeScreen(
                viewModel = viewModel,
                onNavigateToCheckNews = { navController.navigate(Screen.CheckNews.route) },
                onNavigateToHistory = { navController.navigate(Screen.History.route) },
                onNavigateToHowItWorks = { navController.navigate(Screen.HowItWorks.route) },
                onNavigateToModelInfo = { navController.navigate(Screen.ModelInfo.route) },
                onNavigateToSettings = { navController.navigate(Screen.Settings.route) }
            )
        }

        composable(Screen.CheckNews.route) {
            CheckNewsScreen(
                viewModel = viewModel,
                onNavigateToResult = { navController.navigate(Screen.Result.route) },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Result.route) {
            ResultScreen(
                viewModel = viewModel,
                onCheckAnother = {
                    navController.navigate(Screen.CheckNews.route) {
                        popUpTo(Screen.Home.route)
                    }
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.History.route) {
            HistoryScreen(
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.HowItWorks.route) {
            HowItWorksScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.ModelInfo.route) {
            ModelInfoScreen(
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Settings.route) {
            SettingsScreen(
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
