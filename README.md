[Flipr API]: https://flipr.freshdesk.com/fr/support/discussions/topics/36000003955
[Flipr App]: https://apps.apple.com/fr/app/flipr/id1225898851
[laMetric]: https://lametric.com/fr-FR/time/overview
# scriptr.io

Scripts I use on scriptr.io 

# flipr2lametric

This script takes 3 parameters: `email password serial`

- email is the [Flipr API] password
- password is the [Flipr API] passord
- serial is the Flipr Serial, you can find it in the [Flipr App]
- auth_token: token for scriptr.io access

The script returns JSON compatible with [laMetric].

[laMetric] will display 3 frames: Pool temperature, PH, Chlore.

# pluie1h

Le script utilise le paramètre `location` qui est la latitude et la longitude (separées par une virgule).

Pour savoir quelles données sont retournées par Météo France, [voir ici](https://github.com/liorzoue/ext-meteo/blob/master/chrome-ext/js/data-sample.json).

Le script renvoie un json utilisable par [laMetric].

[laMetric] affichera 1 ou 2 écrans: Temps en minutes avant la prochaine pluie (ou + 1h). Et si de la pluie
est prévue alors un graphe affichera les précipitations attendue dans l'heure (graphe).

# weather

2 en 1: Une application weather basée sur openweather (comme celle de laMetric) à laquelle s'ajoute des predictions de pluie à 1h. Les predictions à 1h ne s'affichent que si de la pluie est prévue dans l'heure.

Le script a besoin de:

- owkey: la clé api openweather
- zip: le positionnement sous forme de zip code e.g: "33600,fr"
- location: l'emplacement (idem pluie1h)
- auth_token: le token pour scriptr.io
