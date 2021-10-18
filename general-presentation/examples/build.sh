for d in * ; do
  if [ -d "$d" ]; then
    cd "$d"
    echo "$d"
    #npm i
    npm run build
    cp -r dist "../../docs/examples/$d"
    cd ..
  fi
done
