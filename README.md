# player_interface

Voces de la Extinción es un proyecto que propone la grabación del paisaje sonoro del
bosque nativo de la Provincia de Córdoba, del que hoy queda el 3%. Plantea la escucha y
la grabación del Bosque Chaqueño Serrano como una práctica de intervención social, no
como un registro científico. Lo lleva adelante la asociación civil Los Manantiales junto
a Tica Hen Río Ceballos, y el material se muestra al público en museos y exposiciones.

Sitio público: https://vocesdelaextincion.com

El trabajo está repartido en tres repos:

- `aws_backend`: la API y el almacenamiento de las grabaciones.
- `frontend`: el sitio público y el panel de administración.
- `player_interface`: la app de kiosco que se usa en las exposiciones, sin conexión.

## Qué es este repo

La app de kiosco. Es la que corre en la computadora de la exposición, en pantalla
completa, táctil, sin cursor y sin scroll. El visitante toca los íconos y los sonidos se
superponen entre sí, así que arma su propia mezcla del monte en lugar de escuchar una
lista.

Funciona sin conexión. Las grabaciones y los videos viajan adentro del proyecto, en
`media/`, así que no habla con `aws_backend` ni con nada más. Reemplaza a la app vieja,
un WordPress local, que se venía usando en los museos.

Está hecha con Electron y React. Los estados de la app (idle, activo, admin, bloqueo) y
la máquina donde corre están en `ARCHITECTURE.md`. Las decisiones visuales, en
`DESIGN.md`.

## Setup

Al instalar, `node` tiene que ser Node 22, que es lo que fijan `.nvmrc` y
`.node-version`. Con versiones más nuevas el instalador de Electron corrompe su propio
binario y no avisa.

```bash
bun install
bun run dev
```

Si `bun run dev` falla con `Error: Electron uninstall`, es ese problema. Se arregla
extrayendo el binario sin que Node participe:

```bash
bun install --ignore-scripts
bun node_modules/electron/install.js
```

Para generar lo que se lleva al museo:

```bash
bun run build:win:zip
```

Eso deja un zip en `dist/`. Se descomprime en la máquina y se corre
`player-interface.exe`, sin instalador. Los demás targets, y por qué el proyecto está
clavado a Electron 22, están en `ARCHITECTURE.md`.
