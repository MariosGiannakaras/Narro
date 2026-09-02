with open("WORK_LOG.md", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('\x0cocusSurface', 'ocusSurface')
text = text.replace('\x0c', 'f')
text = text.replace('\nync', 'async')
text = text.replace('\npm', 'npm')
text = text.replace('\nustup', 'rustup')
text = text.replace('\x0earro', 'narro')
text = text.replace('\x0e', 'n')

with open("WORK_LOG.md", "w", encoding="utf-8") as f:
    f.write(text)
