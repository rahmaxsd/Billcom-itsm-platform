# billcom-itsm-platform

Plateforme de gestion de tickets IT : employés, techniciens et administrateurs.

| Partie | Technologie |
|---|---|
| Front | Angular 19, NgRx, WebSocket STOMP |
| Back | Spring Boot (REST, JWT, WebSocket) |
| Base | MySQL 8 (migrations Flyway) |
| Lancement | Docker Compose |

## Lancer le projet

Seul **Docker Desktop** est nécessaire (ouvert avant de commencer).

```bash
docker compose up --build
```

Le premier démarrage dure quelques minutes (téléchargement des images, compilation).

| Service | Adresse |
|---|---|
| Application | http://localhost:4200 |
| API | http://localhost:8080 |
| MySQL (depuis le Mac) | localhost:3307 |

Arrêter : `docker compose down` (ajouter `-v` pour supprimer aussi les données).

## Comptes de démonstration

| E-mail | Mot de passe | Rôle |
|---|---|---|
| admin@billcom.com | Admin123! | Administrateur |
| tech@billcom.com | Admin123! | Technicien |
| user@billcom.com | Admin123! | Employé |

## Configuration

Copier `.env.example` en `.env` pour changer les mots de passe et le secret JWT. Ne jamais pousser `.env`.

## Structure

```
backend/   API Spring Boot + Dockerfile
frontend/  Application Angular + Dockerfile + nginx.conf
docker-compose.yml
```

## Développement sans Docker pour le front

```bash
cd frontend && npm install && npm start   # http://localhost:4200, proxy vers le back sur :8080
```
