# Changelog for RUSK

## RUSK v0.0.9

Nye funksjoner:

- Hurtigsvar-editor direkte i forumtråden, med selection-basert siteringsfunksjon. Hurtigsvar på valgt innlegg med Shift-R. Legg inn hurtigsvar med Ctrl-Enter.

Bugfixes:

- Fjernet knapper som ble med over når innlegg ble åpnet i nytt vindu.

Optimaliseringer:

- Konfigurert CSS injisers tidligere
- Hele RUSK kjører tidligere i page load syklusen, slik at ting føles (og er!) kjappere.

## RUSK v0.0.8

Publisert 31/12-2018

Nye funksjoner:

- RBKweb (forumet) vil nå fylle bredden på browseren din, innen visse rammer. Takk, Stubbelur!
- Embedding av Streamable-linker.
- Fjerning av linker som embeddes.
- Embedding av MP4 og webm-filer vha. video-tag.
- Når man svarer i en tråd får man opp emnet som en påminnelse om å holde seg til det.
- Tråder du har skjult blir nå markert som lest når vi ser de har uleste meldinger på en side.
- Menyvalg for å åpne et innlegg i eget vindu (f.eks. for å se video mens du surfer videre på RBKweb).
- Fjerning av enkelte meldinger som ikke er relevante for registrerte brukere for mer tilgjengelig skjermplass.
- Parsing av sidedata fra RBKweb som brukes av flere moduler har blitt samlet og gjøres nå kun én gang pr. side.

Bugfixes:

- Bedre gjenkjenning av hvilke sider vi er på.
- Finner poster id for gjesteposter korrekt.
- Bedre gjenkjenning av signaturer.
- Bokmerker funker nå bedre med norske foruminnstillinger.
