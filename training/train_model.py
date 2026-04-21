from transformers import T5Tokenizer, T5ForConditionalGeneration

# minimal inference test (no heavy training)

tokenizer = T5Tokenizer.from_pretrained("t5-small")
model = T5ForConditionalGeneration.from_pretrained("t5-small")

text = "rewrite: This is important research"
inputs = tokenizer(text, return_tensors="pt")
outputs = model.generate(**inputs, max_length=50)

print(tokenizer.decode(outputs[0], skip_special_tokens=True))
