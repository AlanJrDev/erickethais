# Erick × Thais — Experiência React

Site interativo de aniversário para **Thais**, feito por **Erick** e com o nosso maior presente: **Benício**.

## Stack

| Camada | Tecnologia |
|--------|------------|
| UI | React 19 |
| Build | Vite 6 |
| Animação | GSAP 3.12 |
| Estilos | CSS global (design tokens + cenas) |

## Estrutura

```
├── index.html          # entry Vite
├── public/media/       # fotos, vídeo do final e música ambiente
├── src/
│   ├── main.jsx        # bootstrap React
│   ├── App.jsx         # markup das cenas (JSX)
│   ├── experience.js   # motor imperativo (nav, timeline, constelação, livro…)
│   └── styles.css      # design system + layout das cenas
└── package.json
```

## Comandos

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # produção → dist/
npm run preview  # prévia do build
```

## Datas

As datas estão marcadas como `__/__/____` no site, para preencher depois:

- `src/experience.js` → `START_DATE` (contador)
- `src/App.jsx` → hero, timeline, cartas, livro e contador
- `src/experience.js` → `LETTER_DATA` (carta 05) e `pages` (página 03)

## Notas

- Todo o conteúdo de mídia fica em `public/media/` e é servido na raiz (`/media/...`).
- O vídeo do clímax (`media/video.mp4`) é o único vídeo do site; as demais cenas usam fotos.
- `experience.js` mantém a lógica DOM original; o React monta o markup e o motor liga os listeners no `useEffect`.
