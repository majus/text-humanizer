from transformers import T5Tokenizer, T5ForConditionalGeneration

class LocalRewriter:
    def __init__(self, model_path="./model"):
        self.tokenizer = T5Tokenizer.from_pretrained(model_path)
        self.model = T5ForConditionalGeneration.from_pretrained(model_path)

    def rewrite(self, text):
        prompt = f"rewrite: {text}"
        inputs = self.tokenizer(prompt, return_tensors="pt", truncation=True)
        outputs = self.model.generate(**inputs, max_length=128)
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)

if __name__ == "__main__":
    model = LocalRewriter()
    print(model.rewrite("This is important research"))
