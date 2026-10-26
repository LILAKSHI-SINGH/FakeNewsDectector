package com.example.fakenewsdetector.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HowItWorksScreen(onNavigateBack: () -> Unit) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("How It Works", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {

            Text(
                text = "ML Detection Pipeline Architecture",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            PipelineStepCard(
                stepNumber = 1,
                title = "1. User Enters News",
                description = "Input news headline, article body text, or optional web page URL.",
                icon = Icons.Default.EditNote
            )

            DownArrowConnector()

            PipelineStepCard(
                stepNumber = 2,
                title = "2. Text Preprocessing",
                description = "Text cleaning, lowercasing, HTML tag stripping, URL removal, punctuation removal, tokenization, and stopword removal.",
                icon = Icons.Default.CleaningServices
            )

            DownArrowConnector()

            PipelineStepCard(
                stepNumber = 3,
                title = "3. TF-IDF Feature Extraction",
                description = "Converts textual tokens into numerical vector representations (Term Frequency - Inverse Document Frequency).",
                icon = Icons.Default.GraphicEq
            )

            DownArrowConnector()

            PipelineStepCard(
                stepNumber = 4,
                title = "4. Machine Learning Model",
                description = "Transmits vector features to trained classifier (Linear SVM / Logistic Regression / Naive Bayes / Random Forest).",
                icon = Icons.Default.Memory
            )

            DownArrowConnector()

            PipelineStepCard(
                stepNumber = 5,
                title = "5. Prediction",
                description = "Evaluates article features and classifies text into LIKELY FAKE or LIKELY REAL probability space.",
                icon = Icons.Default.Psychology
            )

            DownArrowConnector()

            PipelineStepCard(
                stepNumber = 6,
                title = "6. Confidence Calculation",
                description = "Computes calibrated probability percentage scores and assigns risk level (HIGH, MEDIUM, LOW).",
                icon = Icons.Default.Speed
            )

            DownArrowConnector()

            PipelineStepCard(
                stepNumber = 7,
                title = "7. Explanation & Indicators",
                description = "Extracts top influential TF-IDF terms (Explainable AI) that contributed to the model decision.",
                icon = Icons.Default.Lightbulb
            )
        }
    }
}

@Composable
fun PipelineStepCard(stepNumber: Int, title: String, description: String, icon: ImageVector) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(
                        color = MaterialTheme.colorScheme.primaryContainer,
                        shape = CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = description,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
        }
    }
}

@Composable
fun DownArrowConnector() {
    Box(
        modifier = Modifier.fillMaxWidth(),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = Icons.Default.ArrowDownward,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(24.dp)
        )
    }
}
