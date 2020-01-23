#!/usr/bin/env bash

dir=support/package-aur
if [[ -d ../../${dir} ]]; then
  cd ../..
elif [[ ! -d ${dir} ]]; then
  echo "this script should be executed from project root dir."
  exit 1
fi

function fn_setup {
  pkgname=redshape
  pkgver=$(grep 'version' package.json | sed -E "s| *\"version\" *: *\"([^\"]+)\".*|\1|")
}

function fn_pack {
  output=${dir}/${pkgname}-${pkgver}.tar.gz
  tar cvfz ./$output --exclude='./.circleci' --exclude='__tests__' --exclude='__mocks__' --exclude='./coverage' --exclude='./support' --exclude='./dist' --exclude='./test' --exclude='./docs' --exclude='./node_modules' --exclude='./build' --exclude-vcs --exclude-vcs-ignores . --transform='s|^\.|'"${pkgname}-${pkgver}"'|' 
  echo "packed in ${output}"
}

function fn_pkgbuild {
  output=${dir}/${pkgname}-${pkgver}.tar.gz
  md5=$(md5sum ${output} | tr -s ' ' | cut -d' ' -f1) 
  sed -i -E 's|pkgver=.*$|pkgver='"$pkgver"'|;s|md5sums=.*$|md5sums=("'"${md5}"'")|' ${dir}/PKGBUILD
  echo "updated ${dir}/PKGBUILD with version ${pkgver} and checksum ${md5}"
}

function fn_makepkg {
  cd ${dir}
  makepkg -f
}

while [ $# -gt 0 ];
do
  case $1 in
    pack)
      fn_setup
      fn_pack
      ;;
    pkgbuild)
      fn_setup
      fn_pkgbuild
      ;;
    makepkg)
      fn_makepkg
      ;;
  esac
  shift
done

exit 0
