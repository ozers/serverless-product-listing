# serverless-product-listing

# Gelistirmede kullanilan product array'ini iceren gist linki
https://gist.github.com/ozers/72f5661144d46f258e63a921b92ac28b.js

* src/create-or-update-products -> Eklenmesi/guncellenmesi istenen product object'ini Dynamodb ve Redis uzerine ekler/gunceller.
* src/fetch-product-detail -> Product'la iliskili name + seller_id kullanilarak bulunan product bilgilerini Redis uzerinden doner, Redis'te kayit olmamasi durumunda Dynamo'da kaydin olup olmadigini kontrol eder. Kayit varsa Redis'e bu kaydi ekler.
* src/list-products -> Belirtilen miktardaki product array'ini Redis uzerinden doner. `price` alaniyla siralanmis sekilde donus opsiyonu vardir (tamamlanamadi)

# Upstash
Geliştirmede Redis olarak Upstash'i kullandım. DB bilgilerini .env dosyasına yazdım. Şu anda .env dosyasında sample olarak duruyor, projeyi sildikten sonra bu DB'yi sildim. Redis için Upstash üzerinden Tablo oluşturulup connection bilgileri .env üzerinden alınmalıdır.
Buradaki bilgiler güvenlik açısından sorun yaratacağı ihtimaline karşılık bilgiler Secret Manager'da tanımlanıp buradan kullanılabilir.

# Proje Kurulumu

```bash
serverless-product-listing$ cd src/create-or-update-product
create-or-update-product$ npm install
serverless-product-listing$ cd ../fetch-product-detail
fetch-product-detail$ npm install
fetch-product-detail$ cd ../list-products
list-products$ npm install
list-products$ cd ../../
serverless-product-listing$ sam build

Build Succeeded

serverless-product-listing$ sam deploy --guided

Configuring SAM deploy
======================

        Looking for config file [samconfig.toml] :  Found
        Reading default arguments  :  Success

        Setting default arguments for 'sam deploy'
        =========================================
        Stack Name [productListing]: 
        AWS Region [eu-west-1]: 
        #Shows you resources changes to be deployed and require a 'Y' to initiate deploy
        Confirm changes before deploy [Y/n]: y
        #SAM needs permission to be able to create roles to connect to the resources in your template
        Allow SAM CLI IAM role creation [Y/n]: y
        #Preserves the state of previously provisioned resources when an operation fails
        Disable rollback [y/N]: n
        CreateProductFunction may not have authorization defined, Is this okay? [y/N]: y
        FetchProductDetailFunction may not have authorization defined, Is this okay? [y/N]: y
        ListProductsFunction may not have authorization defined, Is this okay? [y/N]: y
        Save arguments to configuration file [Y/n]: y
        SAM configuration file [samconfig.toml]: 
        SAM configuration environment [default]: 
...
...
...
Previewing CloudFormation changeset before deployment
======================================================
Deploy this changeset? [y/N]: y

```
Kurulum bittikten sonra
AWS Lambda uzerinde 3 adet Lambda ayaga kalkacaktir.
Amazon API Gateway >> Stages icerisindeki Prod stage'de Lambda'lara ait endpointler olusturulmus olacak.
