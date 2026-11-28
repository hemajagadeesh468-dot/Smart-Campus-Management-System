FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY lib/sqlite-jdbc-3.54.1.0.jar lib/sqlite-jdbc-3.54.1.0.jar
COPY src src

RUN mkdir -p out database && javac --add-modules jdk.httpserver -cp "lib/sqlite-jdbc-3.54.1.0.jar" -d out src/main/java/campusiq/faculty/*.java

EXPOSE 8081

CMD ["sh", "-c", "java --add-modules jdk.httpserver -cp 'out:lib/sqlite-jdbc-3.54.1.0.jar' campusiq.faculty.CampusServer ${PORT:-8081}"]
