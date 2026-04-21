import random

# Higher-quality pair generation strategies

def adjacent_sentence_pairs(sentences):
    pairs = []
    for i in range(len(sentences) - 1):
        s1 = sentences[i].strip()
        s2 = sentences[i+1].strip()
        if len(s1.split()) > 6 and len(s2.split()) > 6:
            pairs.append(("rewrite: " + s1, s2))
    return pairs


def slight_rewrite(sentence):
    words = sentence.split()
    if len(words) < 6:
        return sentence

    # swap small chunks instead of full shuffle
    i = random.randint(0, len(words)//2)
    j = random.randint(i+1, len(words))
    chunk = words[i:j]
    random.shuffle(chunk)
    new_words = words[:i] + chunk + words[j:]
    return " ".join(new_words)


def hybrid_pairs(sentences):
    pairs = []
    for s in sentences:
        if len(s.split()) > 6:
            pairs.append(("rewrite: " + s, slight_rewrite(s)))
    return pairs
