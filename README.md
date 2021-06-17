# Dialoguer

Le dialoguer fonctionne à partir d'un arbre de décisions. Il est possible de modifier l'arbre de décision avec la fonctionnalité d'administration.

Un mot de passe est défini au moment de construire l'application.

## Dépendances

L'application utilise nodejs pour fonctionner. Dans une machine debian on peut installer les dépendances avec la commande:

```
apt install nodejs npm
```

### Secrets

L'arbre de décision est défini dans les fichiers `public/nodes.json` et `public/links.json`. Il y a deux exemples du format attendu dans `public/nodes-example.json` et `public/links-example.json`.

## Build

Il faut installer les dépendances javascript pour construire l'application. Les dépendances sont listés dans le fichier `package.json`. Elle sont installées avec la commande:

```
npm install 
```

Pour construire l'image on peut utiliser la commande:

```
PASSWORD=secret npm run build
```

La variable `PASSWORD` permet d'acceder aux fonctionnalités d'administration.

## Utilisation

Pour lancer l'application, on peut utiliser la commande:

```
node public/index.js
```

La fonctionnalité de restauration de l'arborescence utilise le fichier `public/nodesBACK.json` et `public/linksBACK.json`, donc vous pouvez faire une copie des fichiers pour garder un point de départ.
