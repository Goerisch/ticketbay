# ticketbay

Anwendung zum Kaufen und Verkaufen von Tickets (Ebay für Tickets)

## Architektur der Anwendung

Die Anwendung läuft vollständig in einem Kubernetes Cluster.
Die Kommunikation der Services untereinander erfolgt primär über einen Event-Bus (Nats-Streaming-Server).
Die Services sind in Typescript (Node.js) implementiert.
Jeder Service verfügt über eine eigene Datenhaltung (Mongo-DB / Redis DB).

### Backend

Das Backend besteht aus Services für die Verwaltung von Tickets, Bestellungen, Zahlungen, sowie dem Ablauf von unbezahlten Bestellungen nach einer bestimmten Zeit.

Zudem gibt es einen Service für die Authentifizierung.

### Oberfläche

Die Oberfläche ist mit React und next.js (Server-side-rendering) implementiert und relativ simpel gehalten, da der Fokus auf dem Backend lag.

### Common

Ein common-modul stellt sicher, dass die Events einheitlich implementiert werden und doppelter code vermieden wird.

## Development

Der Cluster kann lokal mit skaffold gestartet werden. "skaffold dev".
Voraussetzung: Docker Desktop muss lokal gestartet sein und Kubernetes muss in Docker Desktop aktiviert sein.
