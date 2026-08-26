# Rapports d'intervention – SARL IMPEC

PWA mobile autonome pour créer et conserver des rapports d'intervention technique sur iPhone.

## Lancer localement

Le service worker exige un serveur HTTP. Depuis ce dossier, lancer par exemple :

```powershell
python -m http.server 8080
```

Puis ouvrir `http://localhost:8080`. Pour un iPhone, le site devra être servi en HTTPS afin de permettre l'installation, la dictée et le fonctionnement PWA complet.

## Données et sécurité

- Les rapports et photos compressées sont conservés dans le stockage local du navigateur.
- Aucune clé d'API ni aucun mot de passe Gmail n'est stocké dans le code.
- La reformulation appelle l'URL configurée dans Paramètres, par défaut `/api/reformulate`.
- Tant que ce service n'est pas raccordé, la dictée originale reste enregistrée et aucune donnée n'est perdue.
- Dans la PWA installée sur iPhone, le bouton de dictée ouvre le champ puis utilise le micro du clavier iOS. Safari ne garantit pas l'API Web Speech dans une application ajoutée à l'écran d'accueil.

## Contrat attendu pour l'API IA

Requête `POST /api/reformulate` :

```json
{"text":"dictée originale","sections":["observation","diagnosis","work","parts","tests","notes"]}
```

Réponse JSON attendue :

```json
{
  "observation":"…",
  "diagnosis":"…",
  "work":"…",
  "parts":"…",
  "tests":"…",
  "notes":"…"
}
```

Le backend devra interdire toute invention et préserver fidèlement les informations techniques.
