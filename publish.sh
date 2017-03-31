set -e

# this script expects a number of environment variables to be set
# COMMUTE_SSH_SERVER   the address to push to
# COMMUTE_SSH_OPTIONS  any additional ssh options to use
# COMMUTE_PATH         the path on the server to publish files to

# example configuration:
# export COMMUTE_SSH_SERVER=user@example.com
# export COMMUTE_SSH_OPTIONS="-i <keyfile>"
# export COMMUTE_PATH=/var/www/commute

TOP_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

(cd $TOP_DIR && rm -rf dist/)
(cd $TOP_DIR && npm run build)

ssh $COMMUTE_SSH_OPTIONS $COMMUTE_SSH_SERVER "rm -rf $COMMUTE_PATH/*"
ssh $COMMUTE_SSH_OPTIONS $COMMUTE_SSH_SERVER "mkdir -p $COMMUTE_PATH/static"
scp $COMMUTE_SSH_OPTIONS $TOP_DIR/index.html $COMMUTE_SSH_SERVER:$COMMUTE_PATH/
scp $COMMUTE_SSH_OPTIONS $TOP_DIR/dist/* $COMMUTE_SSH_SERVER:$COMMUTE_PATH/static
