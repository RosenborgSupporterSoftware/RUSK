# RUSK - RBKweb Ultimate Survival Kit (A Chrome Extension)

[![Join the chat at https://gitter.im/RBKweb-ext/Lobby](https://badges.gitter.im/RBKweb-ext/Lobby.svg)](https://gitter.im/RosenborgSupporterSoftware/RUSK?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Dette er en Chrome-extension som legger til funksjonalitet og diverse digg til RBKweb-forumet.

## Features

- Fjerner redundante deler av side-titlene så en kompakt rekke med tabs lettere identifiseres.
- Endrer highlight-farge ved forum-søk.
- Gir mer tydelig varsel om man har uleste private meldinger.
- Legger på ukedag i kampoversiktene.
- Fargelegger resultatene (seier/uavgjort/tap) i kampoversiktene.
- Tracker og varsler om brukere endrer brukernavn.
- Optimaliserer browserens sidelasting.
- Legger til en rute for brukertips.
- På sider hvor man oppretter eller redigerer innlegg/tråder vil tekstboksen vokse i takt med innholdet.
- Man kan trykke hurtigtast `Ctrl-Enter` for å legge inn innlegg uten å klikke med mus e.l.
- Feltene man vanligvis ønsker å starte i blir fokusert på sider hvor man legger inn innlegg.

## Viktige punkter for å bruke/utvikle utvidelsen

Må utvides etterhvert som prosjektet utvikles.

- Husk å kjøre
```
npm install
```
når du har hentet ned fra github (glemmer dette litt for ofte, Rune anm.)
- For å bygge en ferdig extension:
```
npm run build
```

- For å kjøre "watch mode" der extension blir bygget og oppdatert etterhvert som man gjør endringer:
```
npm run watch
```
eller `Ctrl + Shift + B` i VS Code.
- Laste inn extension i Chrome: last inn `dist/` som en upakket utvidelse.
- Laste inn extension i Firefox: cd inn i `dist/` etter bygging og kjør `web-ext run`.

