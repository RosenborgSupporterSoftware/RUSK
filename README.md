# RUSK - RBKweb Ultimate Survival Kit (A Chrome Extension)

[![Join the chat at https://gitter.im/RBKweb-ext/Lobby](https://badges.gitter.im/RBKweb-ext/Lobby.svg)](https://gitter.im/RosenborgSupporterSoftware/RUSK?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Dette er en Chrome-extension som legger til funksjonalitet og diverse digg til RBKweb-forumet.
Det meste av funksjonalitet kan skrus av og på eller fininnstilles via et konfigurasjons-GUI.

## Features

Se [ChangeLog](ChangeLog.md) for kronologisk liste over features som er lagt til og andre
endringer.

- Gjør linker til Youtube-videoer om til videoavspillere i foruminnlegg.
- Gjør linker til tweets om til tweetene direkte i foruminnlegg.
- Gjør linker til Instagram-poster om til Instagram-postene direkte i foruminnlegg.
- Legger til videoavspiller der det linkes til Streamable.
- Lar deg filtrere bort brukere fra forumet eller fra enkelttråder.
- Lar deg filtrere bort uinteressante forumtråder.
- Lar deg skjule brukerenes signaturer i forumpostene.
- Lar deg bokmerke innlegg du vil gå tilbake til senere.
- Lar seg poste innlegg direkte fra forum-tråd-sidene, med forenklet utiklipping av sitater.
- Fjerner redundante deler av side-titlene så en kompakt rekke med browser-tabs lettere identifiseres.
- Endrer tekst-highlight-farge ved forum-søk.
- Gir mer tydelig varsel om man har uleste private meldinger.
- Legger på ukedag i kampoversiktene.
- Fargelegger resultatene (seier/uavgjort/tap) i kampoversiktene.
- Tracker og varsler om brukere endrer brukernavn.
- Optimaliserer browserens side-innlasting.
- Endrer forumtråd-linker så de sender deg til de nye innleggene istedenfor starten av tråden.
- Farvelegger de forumpostene du ikke har lest før med egen bakgrunnsfarve.
- På sider hvor man oppretter eller redigerer innlegg/tråder vil tekstboksen vokse i takt med innholdet.
- Optimaliserer poll-innlegging, og lar deg lagre 3 poll-oppsett for gjenbruk senere.
- Man kan trykke hurtigtast `Ctrl-Enter` for å legge inn innlegg uten å klikke med mus e.l.
- Forumlister og diskusjonstråder kan navigeres med tastaturet. (hjkl + (r)eply, (q)uote, ++)
- Feltene man vanligvis ønsker å starte i blir fokusert på sider hvor man legger inn innlegg.
- Legger til en rute for brukertips.

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

