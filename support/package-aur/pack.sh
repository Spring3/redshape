#!/usr/bin/env bash

dir=support/package-aur
if [[ -d ../../${dir} ]]; then
  cd ../..
elif [[ ! -d ${dir} ]]; then
  echo "this script should be executed from project root dir."
  exit 1
fi

source ${dir}/PKGBUILD

tar cvfz ./${dir}/${pkgname}-${pkgver}.tar.gz --exclude='./.circleci' --exclude='__tests__' --exclude='__mocks__' --exclude='./coverage' --exclude='./support' --exclude='./dist' --exclude='./test' --exclude='./docs' --exclude='./node_modules' --exclude='./build' --exclude-vcs --exclude-vcs-ignores . --transform='s|^\.|'"${pkgname}-${pkgver}"'|'
