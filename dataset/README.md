# Fake News Detection Dataset

This directory contains the dataset used for training and evaluating the Machine Learning models for fake news detection.

## Dataset Structure
The dataset CSV file (`sample_news_dataset.csv`) contains the following columns:
- `title`: The headline or title of the news article.
- `text`: The main content / body text of the article.
- `label`: Target indicator (`FAKE` / `REAL` or `0` / `1`).

## Data Sources & Format
- `REAL` / `1`: Verifiable news articles from standard news outlets.
- `FAKE` / `0`: Fabricated, clickbait, or deceptive articles.

## Replacing with Larger Datasets
To train on larger benchmark datasets (such as Kaggle WELFake, ISOT Fake News Dataset, or LIAR dataset):
1. Place your CSV file in `dataset/`
2. Ensure columns `title`, `text`, and `label` exist (or update `ml/train.py` accordingly).
3. Re-run training using:
   ```bash
   python ml/train.py
   ```
