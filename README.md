# Tun Fu Chung Massoterapia

Landing page da Tun Fu Chung Massoterapia (Natal/RN). Site estático em HTML, CSS e JavaScript puro, sem build, pronto para a Vercel.

## Estrutura

- `index.html`: página única
- `assets/css/style.css`: estilos (paleta verde floresta, linho, quase preto e terracota; Fraunces + Montserrat)
- `assets/js/main.js`: animações (revelar palavras, máscara nas fotos, texto que se preenche, cartões que empilham, odômetro, galeria horizontal, rolagem com inércia no desktop, sanfona)
- `assets/img/`: fotos em AVIF, WebP e JPG em mais de uma largura
- `favicon.svg`, `apple-touch-icon.png`, `og-image.jpg`, `robots.txt`, `sitemap.xml`, `vercel.json`

## Rodar localmente

```bash
python3 -m http.server 8000
```

## Deploy

Importe o repositório na Vercel com o preset "Other", sem comando de build e com diretório de saída na raiz.
Se o domínio final for diferente de `chung-massoterapia.vercel.app`, atualize a URL em `index.html` (canonical, og:image, JSON-LD), `robots.txt` e `sitemap.xml`.
