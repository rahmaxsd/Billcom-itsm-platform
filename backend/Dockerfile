# ---------- Étape 1 : compilation (Maven + JDK) ----------
ARG JAVA_VERSION=21
FROM eclipse-temurin:${JAVA_VERSION}-jdk AS build
WORKDIR /app

# On copie d'abord le pom : les dépendances sont mises en cache tant que le pom ne change pas
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline

COPY src src
RUN ./mvnw -B -q package -DskipTests

# ---------- Étape 2 : image finale (JRE seulement, plus légère) ----------
FROM eclipse-temurin:${JAVA_VERSION}-jre
WORKDIR /app

RUN useradd --system --uid 1001 spring
COPY --from=build /app/target/*.jar app.jar
USER spring

EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
