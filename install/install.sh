#!/bin/sh
# rCTF installation script
# Supports Debian-like distros and Arch Linux

set -e

fg_cyan="\033[36m"
bold_fg_white="\033[1;37m"
bg_red="\033[41m"
reset="\033[0m"

error() {
  # shellcheck disable=SC2059
  printf "${bg_red}${bold_fg_white}%s %s${reset}\n" "[-]" "$*" 1>&2
}

info() {
  # shellcheck disable=SC2059
  printf "${fg_cyan}%s %s${reset}\n" "[*]" "$*"
}

get_key() {
  head -c 32 /dev/urandom | base64 -w 0
}

do_install() {
  info "Installing rCTF..."

  if [ ! "$(id -u)" = 0 ]; then
      error "You must run this script as root."
      exit 1
  fi

  RCTF_INSTALL_PATH="${RCTF_INSTALL_PATH:-"/opt/rctf"}"

  if [ ! -d "$(dirname "$RCTF_INSTALL_PATH")" ]; then
    error "The parent of \$RCTF_INSTALL_PATH ($(dirname "$RCTF_INSTALL_PATH")) does not exist."
    exit 1
  fi

  if [ -d "$RCTF_INSTALL_PATH" ]; then
    error "rCTF appears to already be installed in ${RCTF_INSTALL_PATH}"

    info "... If you're trying to start rCTF, run 'docker-compose up -d'."
    info "... If you're trying to reinstall rCTF, 'rm -rf $RCTF_INSTALL_PATH' then re-run this script."

    exit 1
  fi

  mkdir "$RCTF_INSTALL_PATH"
  cd "$RCTF_INSTALL_PATH"

  info "Installing dependencies..."

  if [ ! -x "$(command -v docker)" ]; then
    curl https://get.docker.com | sh
  fi

  if [ ! -x "$(command -v docker-compose)" ]; then
    curl -fsSLo /usr/local/bin/docker-compose "https://github.com/docker/compose/releases/download/1.26.2/docker-compose-$(uname -s)-$(uname -m)"
    chmod +x /usr/local/bin/docker-compose
  fi

  info "Configuring rCTF..."

  RCTF_GIT_COMMIT="${RCTF_GIT_COMMIT:-"{{git_commit}}"}"

  mkdir -p conf.d data/rctf-postgres data/rctf-redis

  printf "%s\n" \
  "RCTF_DATABASE_PASSWORD=$(get_key)" \
  "RCTF_REDIS_PASSWORD=$(get_key)" \
  "RCTF_GIT_COMMIT=$RCTF_GIT_COMMIT" \
  > .env

  printf "%s\n" \
  "ctfName: rCTF" \
  "meta:" \
  "  description: 'A description of your CTF'" \
  "  imageUrl: 'https://example.com'" \
  "homeContent: 'A description of your CTF. Markdown supported.'" \
  > conf.d/01-ui.yaml

  printf "%s\n" \
  "origin: http://127.0.0.1:8080" \
  "divisions:" \
  "  open: Open" \
  "tokenKey: '$(get_key)'" \
  "startTime: $(date +%s)000" \
  "endTime: $(date -d +1week +%s)000" \
  > conf.d/02-ctf.yaml

  info "Downloading rCTF..."

  curl -fsSO "https://raw.githubusercontent.com/redpwn/rctf/$RCTF_GIT_COMMIT/docker-compose.yml"
  docker-compose pull

  info "Finished installation to ${RCTF_INSTALL_PATH}."

  printf "Would you like to start rCTF now (y/N)? "

  read -r result </dev/tty

  if [ "$result" = "y" ]; then
      info "Running 'docker-compose up -d'..."
      docker-compose up -d
      info "rCTF is now running at 127.0.0.1:8080."
      exit 0
  else
      info "If you would like to start rCTF, run 'docker-compose up -d' in $RCTF_INSTALL_PATH."
      exit 0
  fi
}

do_install
