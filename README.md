# ticketbay

Anwendung zum Kaufen und Verkaufen von Tickets (Ebay für Tickets)

Lokal kann die Anwendung über den folgenden Link aufgerufen werden.
[Ticketbay.dev](https://ticketbay.dev)
Temporär ist die Anwendung unter folgendem Link im Internet erreichbar, aufgrund der laufenden Kosten eines gehosteten Kubernetes-Clusters, wird dieser in absehbarer Zeit abgekündigt werden:
[Ticketbucht.de](https://ticketbucht.de)

## Architektur der Anwendung

Die Anwendung läuft vollständig in einem Kubernetes Cluster.
Die Kommunikation der Backend-Services untereinander erfolgt primär über einen Event-Bus (Nats-Streaming-Server).
Die Services sind in Typescript (Node.js) implementiert.
Jeder Service verfügt über eine eigene Datenhaltung (Mongo-DB / Redis DB).

### Backend

Das Backend besteht aus Services für die Verwaltung von Tickets, Bestellungen, Zahlungen, sowie dem Ablauf von unbezahlten Bestellungen nach einer bestimmten Zeit.

Zudem gibt es einen Service für die Authentifizierung.

#### Authentifizierung

Die Authentifizierung erfolgt per JSON Web Token.
Es können anhand einer E-Mail-Adresse und eines Passworts neue User angelegt, sowie bestehende angemeldet und abgemeldet werden.
Zudem kann der aktuell angemeldete User über einen Endpunkt abgefragt werden.

#### Tickets-Service

Per API können neue Tickets erstellt und bearbeitet werden.
Der Service emitiert dafür jeweils Events.
Der Service konsumiert Events für neue/abgebrochene Bestellungen, um die Bearbeitung der Tickets zu verhindern, sofern diese gerade von einem Kunden zum Kauf reserviert sind.

#### Payments-Service

Der Payments-Service nutzt den Service von Stripe um Zahlungen für eine existierende Bestellung abzuwickeln.
Aktuell ist die Test-Api von Stripe angebunden und es werden nur Kreditkartenzahlungen akzeptiert.

Für Testzwecke kann eine beliebige Test-Kreditkartennummer genutzt werden, z.B. von Visa: 4242 4242 4242 4242 mit einem beliebigen Ablaufdatum in der Zukunft und einem beliebigen CVC-Code.

Der Service reagiert auf Events des Orders-Service um Zahlungen nur für aktive Bestellungen zu erlauben.

#### Orders-Service

Es können für existierende Tickets neue Bestellungen per API erstellt werden.
Wenn eine Bestellung bezahlt wurde, ändert sich der Status auf Complete.
Wenn die Bestellung nach einer festgelegten Zeit nicht bezahlt wurde, wird das Ticket wieder freigegeben und die Bestellung storniert.

#### Expiration-Service

Emitiert nach einer bestimmten Zeit (aktuell nur eine Minute, damit das Verhalten besser getestet werden kann) ein Event, damit die Bestellung ausläuft und die Reservierung somit aufgehoben werden kann, sofern diese nicht bereits bezahlt wurde.

### Oberfläche

Die Oberfläche ist mit React und next.js (Server-side-rendering) implementiert und minimalistisch gehalten, da der Fokus in diesem Projekt auf dem komplexen Backend lag.

### Common

Ein common-modul stellt sicher, dass die Events einheitlich implementiert werden und doppelter code vermieden wird.
Das Modul ist als npm-package deployed und somit kein eigener Service.

## Development

Der Cluster kann lokal mit skaffold gestartet werden, um Änderungen der Services automatisiert zu updaten. Dafür muss der Befehl "skaffold dev" ausgeführt werden.
Voraussetzung: Docker Desktop muss lokal gestartet sein und Kubernetes muss in Docker Desktop aktiviert sein.
Zudem muss ein nginx-ingress-controller lokal deployed sein.
