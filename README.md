
# 自动驾驶测试前端

# sdg-frontend
自驾保前端项目

>本文档是前端项目说明文档，自驾保整体环境搭建，请参照：[环境搭建](https://github.com/SelfDriveGuard/sdg-engine/blob/master/docs/setup/setup.md)


## 依赖

### nodejs && npm:
下载最新版nodejs:  [下载地址](https://nodejs.org/en/download/)

安装步骤：[安装方法](https://github.com/nodejs/help/wiki/Installation)

### yarn: 
```
sudo apt-get update

sudo apt-get upgrade

curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
 
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

sudo apt-get install yarn

验证： yarn --version

换源：yarn config set registry https://registry.npm.taobao.org

参考 https://blog.csdn.net/weixin_41996632/article/details/103893264
```
## 安装依赖包
yarn install

## 开发
yarn start

## 部署
yarn run build

