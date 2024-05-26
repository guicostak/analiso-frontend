# analiso-frontend

## Descrição

Esse repositório refere-se ao serviço frontend do site [Analiso](analiso.com.br/)

## Sonar

docker run --rm -e SONAR_HOST_URL=http://host.docker.internal:9000 -e SONAR_LOGIN=sqp_db2284a04fb42d6537b6cd373a22316f083488a2 -e "SONAR_PROJECT_KEY=analiso-frontend" -v "C:\Users\guilh\Desktop\analiso-frontend:/usr/src" sonarsource/sonar-scanner-cli