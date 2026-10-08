@AGENTS.md

## Deploy: push → fork → Vercel

puntoentrena.com se deploya desde el fork `puntoentrenamientoysalud/punto-entrena` (rama `master`), no desde este repo. `.github/workflows/sync-fork.yml` hace `merge-upstream` al fork en cada push a `master`, con el secret `PUNTO` (token fine-grained del dueño del fork: Contents y Workflows en escritura).

Después de cada `git push origin master`:
1. Buscar la ejecución de `sync-fork.yml` de ese commit y seguirla con `gh run watch <id> --exit-status`.
2. Confirmar que `gh api repos/puntoentrenamientoysalud/punto-entrena/commits/master --jq .sha` es igual a `git rev-parse HEAD`.
3. Si no coinciden, avisar con la causa: 403 = permisos del token, 409 = el fork tiene commits propios, 404 = repo mal escrito o el token no tiene acceso, exit 4 / `GH_TOKEN` vacío = secret vacío o renombrado.

Nunca escribir, imprimir ni cargar el valor del token: lo carga el usuario desde GitHub.
