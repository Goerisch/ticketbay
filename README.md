# ticketbay

Anwendung zum Kaufen und Verkaufen von Tickets (Ebay für Tickets)

[Ticketbay.dev](https://ticketbay.dev)

## Architektur der Anwendung

Die Anwendung läuft vollständig in einem Kubernetes Cluster.
Die Kommunikation der Services untereinander erfolgt primär über einen Event-Bus (Nats-Streaming-Server).
Die Services sind in Typescript (Node.js) implementiert.
Jeder Service verfügt über eine eigene Datenhaltung (Mongo-DB / Redis DB).

### Backend

Das Backend besteht aus Services für die Verwaltung von Tickets, Bestellungen, Zahlungen, sowie dem Ablauf von unbezahlten Bestellungen nach einer bestimmten Zeit.

Zudem gibt es einen Service für die Authentifizierung.

#### Authentifizierung

Die Authentifizierung erfolgt per JSON Web Token.
Es können anhand einer E-Mail-Adresse und eines Passworts neue User angelegt, sowie bestehende angemeldet und abgemeldet werden.
Zudem kann der aktuell angemeldete User abgefragt werden.

#### Tickets-Service

Per API können neue Tickets erstellt und bearbeitet werden.
Der Service emitiert dafür jeweils Events.
Der Service konsumiert Events für neue/abgebrochene Bestellungen, um die Bearbeitung der Tickets zu verhindern, sofern diese gerade von einem Kunden zum Kauf reserviert sind.

#### Payments-Service

Der Payments-Service nutzt Stripe um Zahlungen für eine existierende Bestellung abzuwickeln.

Der Service reagiert auf Events des Orders-Service um Zahlungen nur für aktive Bestellungen zu erlauben.

#### Orders-Service

Es können für existierende Tickets neue Bestellungen per API erstellt werden.
Wenn eine Bestellung bezahlt wurde, ändert sich der Status auf Complete.
Wenn die Bestellung nach einer festgelegten Zeit nicht bezahlt wurde, wird das Ticket wieder freigegeben und die Bestellung storniert.

#### Expiration-Service

Emitiert nach einer bestimmten Zeit ein Event, damit die Bestellung ausläuft und die Reservierung somit aufgehoben werden kann, sofern diese nicht bereits bezahlt wurde.

### Oberfläche

Die Oberfläche ist mit React und next.js (Server-side-rendering) implementiert und relativ simpel gehalten, da der Fokus auf dem Backend lag.

### Common

Ein common-modul stellt sicher, dass die Events einheitlich implementiert werden und doppelter code vermieden wird.

## Development

Der Cluster kann lokal mit skaffold gestartet werden. "skaffold dev".
Voraussetzung: Docker Desktop muss lokal gestartet sein und Kubernetes muss in Docker Desktop aktiviert sein.
