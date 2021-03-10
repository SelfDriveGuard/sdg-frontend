cleanup() {
    echo "Cleaning up... Don't forcefully exit"
    echo "All clear! Exit"
    exit
}

trap cleanup SIGINT
trap cleanup SIGTERM
trap cleanup KILL

cd /home/sdg/sdg-frontend

echo "Launching sdg-frontend."
yarn start &
sleep 5

echo "sdg-frontend launched."
sleep infinity
