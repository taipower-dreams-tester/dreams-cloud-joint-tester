# DREAMS雲端對接測試程式

本測試程式旨在驗證雲端太陽能監控業者是否符合台電DREAMS規範，使其針對所管理電站能夠：
1. 將發電資料透過DNP 3.0傳回台電DREAMS系統
2. 透過DNP 3.0接受台電DREAMS系統控制指令，調控變流器之實功/虛功/功率因數上限或是VPset設定

詳細對接細節謹以台電官方公告為準。
如對測試程式本身實作細節有疑問，請於[Issues](https://github.com/thingnario/dreams-cloud-joint-tester/issues)提問，感謝。

## 系統需求
1. Linux機器 (建議為 Ubuntu 18.04，有確實驗證過可以work)
2. 需安裝docker以及docker-compose
```
sudo apt update
sudo apt install docker.io
sudo apt install docker-compose
```
如果遇到安裝docker時ubuntu的台灣伺服器連不上，可以參考[這篇](https://dexter7311.pixnet.net/blog/post/27261462)

## 安裝方式
0. 安裝過程中請確保網路暢通
1. Git clone或下載原始碼到欲安裝的機器，如果是用git clone請確保submodule都有下載完整
```
git clone https://github.com/thingnario/dreams-cloud-joint-tester.git`
cd dreams-cloud-joint-tester
git submodule update --init --recursive
```
2. 在原始碼的根目錄下有.env資料夾，請將裡面的`*.env.sample`都複製一份，並改名為`*.env`(去掉`.sample`)。然後請將裡面內容作適度更改，特別是密碼的部分。
```
MYSQL_ROOT_PASSWORD=top_secret                          # MySQL root 密碼
MYSQL_DATABASE=dreams_business                          # 無須更改
MYSQL_ADDRESS=mysql                                     # 無須更改，"mysql"是docker之間的alias
ADMIN_ACCESS_TOKEN=top_secret_token                     # API server的API token(Admin，供測試程式本身使用)
JOINTER_ACCESS_TOKEN=site_token_for_cloud_jointer       # API server的API token(雲端對接系統專用)
API_HOST=localhost                                      # API server的host name/IP address，非本機使用時請更改
API_PORT=3000                                           # API server的port，有特別做port forwarding才需更改
```
3. 執行**根目錄**下的deploy.sh，過程可能會花30min以上，請耐心等候
```
chmod 755 deploy.sh
sudo ./deploy.sh
```
4. 確認deploy.sh正常執行完畢之後請執行docker ps(必要時請加sudo，以root權限執行)，確認container都有跑起來
```
sudo docker ps
```
```
CONTAINER ID   IMAGE                               COMMAND                  CREATED              STATUS              NAMES
1b85aebeb5d7   dreamscloudjointtester_mq-dreams    "/entrypoint.sh pyth??   About a minute ago   Up 47 seconds       dreamscloudjointtester_mq-dreams_1
dfbb0818bb41   dreamscloudjointtester_dnp3-master  "/entrypoint.sh /dre??   About a minute ago   Up 33 seconds       dreamscloudjointtester_dnp3-master_1
7a9945482f8a   dreamscloudjointtester_master       "docker-entrypoint.s??   About a minute ago   Up About a minute   dreamscloudjointtester_master_1
f8ea868874dd   dreamscloudjointtester_mq           "docker-entrypoint.s??   About a minute ago   Up About a minute   dreamscloudjointtester_mq_1
dfcd177e08a3   dreamscloudjointtester_nginx        "nginx -g 'daemon of??   About a minute ago   Up 47 seconds       dreamscloudjointtester_nginx_1
b279e48d0a0e   mysql:5.7.29                        "docker-entrypoint.s??   About a minute ago   Up About a minute   dreamscloudjointtester_mysql_1
```

## 操作說明
1. 若所安裝之作業系統為視窗版，安裝完畢之後在本機開啟瀏覽器。則網址輸入https://localhost 應可看到如下畫面:
![Entrance](https://github.com/thingnario/dreams-cloud-joint-tester/raw/master/imgs/entrance.png)
2. 請輸入待測雲端系統之IP位址等必要資訊。同時API Token也請代入雲端系統，方能取得電號與DNP 3.0 address的對照表
3. 一切就緒後按下「開始測試」，會進入以下畫面。
![Main UI](https://github.com/thingnario/dreams-cloud-joint-tester/raw/master/imgs/main_ui.png)
4. 測項大致分成自動/手動判斷兩種進行方式，大部分可以跳著進行，唯獨5-1/5-2 與 6-1/6-2不建議分開進行。