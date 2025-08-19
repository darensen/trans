
FROM alpine:3.20 AS builder

ARG NGINX_VERSION=1.25.3
ENV NGINX_VERSION=${NGINX_VERSION}

# Dépendances build pour ModSecurity + module Nginx
RUN apk add --no-cache \
  git build-base autoconf automake libtool cmake linux-headers \
  libxml2-dev pcre-dev curl-dev zlib-dev yajl-dev \
  geoip-dev libmaxminddb-dev openssl-dev \
  curl ca-certificates 

# optionnel mais propre pour HTTPS
RUN update-ca-certificates

WORKDIR /opt

# 1) Compiler la lib ModSecurity v3
RUN git clone --depth=1 -b v3.0.10 https://github.com/SpiderLabs/ModSecurity \
 && cd ModSecurity \
 && git submodule init \
 && git submodule update \
 && ./build.sh \
 && ./configure \
 && make -j"$(nproc)" \
 && make install

# 2) Récupérer le connecteur ModSecurity-nginx
RUN git clone --depth=1 https://github.com/SpiderLabs/ModSecurity-nginx.git

# 3) Télécharger sources Nginx (même version que l'image finale)
RUN curl -fsSLO "http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz" \
 && tar zxf "nginx-${NGINX_VERSION}.tar.gz"

# 4) Compiler le module dynamique
RUN cd "nginx-${NGINX_VERSION}" \
 && ./configure --with-compat --add-dynamic-module=../ModSecurity-nginx \
 && make modules

# 5) OWASP Core Rule Set
RUN git clone --depth=1 https://github.com/coreruleset/coreruleset.git /opt/owasp-crs \
 && cp /opt/owasp-crs/crs-setup.conf.example /opt/owasp-crs/crs-setup.conf

FROM nginx:1.25.3-alpine

RUN apk add --no-cache \
  libstdc++ libxml2 pcre curl zlib yajl geoip libmaxminddb openssl \
  ca-certificates && update-ca-certificates

# Arbo & droits
RUN mkdir -p /etc/nginx/ssl /etc/nginx/modsecurity /var/log/modsecurity /usr/share/nginx/html \
 && chown -R nginx:nginx /var/log/modsecurity

# Certs autosignés (dev)
RUN openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/privkey.pem \
  -out  /etc/nginx/ssl/fullchain.pem \
  -subj "/CN=localhost"

# Module Nginx + libs ModSecurity
COPY --from=builder /opt/nginx-1.25.3/objs/ngx_http_modsecurity_module.so /etc/nginx/modules/
COPY --from=builder /usr/local/modsecurity/lib/ /usr/lib/
COPY --from=builder /usr/local/lib/           /usr/lib/

# CRS + unicode.mapping
COPY --from=builder /opt/owasp-crs /opt/owasp-crs
# souvent présent ici après "make install" :
COPY --from=builder /opt/ModSecurity/unicode.mapping /etc/nginx/modsecurity/unicode.mapping

# Conf Nginx & ModSecurity
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/basic-security.conf       /etc/nginx/modsec/basic-security.conf
COPY nginx/modsecurity.conf /etc/nginx/modsecurity/modsecurity.conf
COPY nginx/crs-setup.conf /opt/owasp-crs/crs-setup.conf

COPY front/ /usr/share/nginx/html/

# Vérifier la conf à l'entrée
CMD ["sh", "-c", "nginx -t && exec nginx -g 'daemon off;'"]

# Healthcheck HTTPS (évite la redirection)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD \
  wget -qO- --no-check-certificate https://127.0.0.1/ >/dev/null 2>&1 || exit 1
