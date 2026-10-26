import re
import string
import nltk
from nltk.corpus import stopwords

# Ensure NLTK stopwords are downloaded silently
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    try:
        nltk.download('stopwords', quiet=True)
    except Exception:
        pass

# Fallback English stopwords list in case NLTK download fails or is offline
FALLBACK_STOPWORDS = set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours",
    "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers",
    "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
    "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are",
    "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does",
    "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
    "while", "of", "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down",
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
    "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
])

def get_stop_words():
    try:
        return set(stopwords.words('english'))
    except Exception:
        return FALLBACK_STOPWORDS

def clean_text(text: str) -> str:
    """
    Cleans input news text for NLP processing:
    1. Lowercases text
    2. Strips HTML tags
    3. Strips URLs
    4. Removes punctuation and numbers/special chars
    5. Removes stopwords
    6. Normalizes whitespace
    """
    if not text:
        return ""
    
    text = str(text).lower()
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    
    # Remove email addresses
    text = re.sub(r'\S+@\S+', ' ', text)
    
    # Remove non-alphanumeric characters (keep basic whitespace and words)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    
    # Tokenize by whitespace
    tokens = text.split()
    
    # Filter stopwords and short tokens (< 2 chars)
    stop_words = get_stop_words()
    filtered_tokens = [w for w in tokens if w not in stop_words and len(w) > 1]
    
    return " ".join(filtered_tokens)

def combine_title_and_text(title: str = "", text: str = "") -> str:
    """
    Combines title and text into a single cohesive string for model input.
    """
    title_str = (title or "").strip()
    text_str = (text or "").strip()
    
    if title_str and text_str:
        return f"{title_str} {text_str}"
    return title_str or text_str
