cleanup() {
    echo "Cleaning up... Don't forcefully exit"
    echo "All clear! Exit"
    exit
}

trap cleanup SIGINT
trap cleanup SIGTERM
trap cleanup KILL

cd /home/carla/ADTest_frontend

echo "Launching ADTest_frontend."
yarn start &
sleep 5

echo "ADTest_frontend launched."
sleep infinity
