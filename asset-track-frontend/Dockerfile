FROM node:20-alpine

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

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
