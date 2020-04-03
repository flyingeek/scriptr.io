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

The script returns JSON compatible with [laMetric].

[laMetric] will display 3 frames: Pool temperature, PH, Chlore.

# pluie1h

Le script utilise le paramètre `location` qui est le code insee avec un zéro ajouté à la fin.

Voir la documentation publiée sur [EasyDomoticz](https://easydomoticz.com/prvision-pluie/) 

Pour savoir quelles données sont retournées par Météo France, [voir ici](https://github.com/liorzoue/ext-meteo/blob/master/chrome-ext/js/data-sample.json).

Le script renvoie un json utilisable par [laMetric].

[laMetric] affichera 1 ou 2 écrans: Temps en minutes avant la prochaine pluie (ou + 1h). Et si de la pluie
est prévue alors un graphe affichera les précipitations attendue dans l'heure (graphe).
