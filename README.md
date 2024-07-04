# analiso-frontend

## Descrição

Esse repositório refere-se ao serviço frontend do site [Analiso](analiso.com.br/)

## Sonar

Para renovar o token acesse http://localhost:9000/account/security

docker run --rm -e SONAR_HOST_URL=http://host.docker.internal:9000 -e SONAR_LOGIN=sqp_aecc4cadc1cc52c081087ba5d1d4819a48ed698c -e "SONAR_PROJECT_KEY=analiso-frontend" -v "C:\Users\guilh\Desktop\analiso-frontend:/usr/src" sonarsource/sonar-scanner-cli


## Eslint

npm run lint ou npm run lint:fix
