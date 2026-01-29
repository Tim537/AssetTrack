FROM node:20-alpine

WORKDIR /app

# Abhängigkeiten installieren
COPY package*.json ./
RUN npm install

# Quellcode kopieren
COPY . .

# Next.js App bauen
RUN npm run build

# Port 3000 freigeben
EXPOSE 3000

# App starten
CMD ["npm", "start"]
