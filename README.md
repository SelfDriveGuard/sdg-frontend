# 自动驾驶测试前端

## 依赖

### nodejs:
 安装包已放在oss上 

https://guard-strike.oss-cn-shanghai.aliyuncs.com/ADTest/node-v14.15.5-linux-x64.tar.xz

环境变量配置：https://github.com/nodejs/help/wiki/Installation

### yarn: 

sudo apt-get update

sudo apt-get upgrade

curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
 
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

sudo apt-get install yarn

验证： yarn --version

换源：yarn config set registry https://registry.npm.taobao.org

参考 https://blog.csdn.net/weixin_41996632/article/details/103893264

## 开发
yarn start

## 部署
yarn run build

