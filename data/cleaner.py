import re

def clean_text(text):
    text = re.sub(r"\[[0-9]+\]","",text)
    text = re.sub(r"\s+"," ",text)
    return text

if __name__ == "__main__":
    sample = "This is a test [1] text"
    print(clean_text(sample))
