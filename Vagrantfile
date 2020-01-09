# -*- mode: ruby -*-
# vi: set ft=ruby :


Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-16.04"
  config.vm.provider "virtualbox" do |v|
    v.memory = 2048
    v.cpus = 2
  end

  config.vm.network "private_network", ip: "192.168.50.4"
  # config.vm.network "private_network", type: "dhcp"
  # config.vm.synced_folder ".", "/vagrant", type: "nfs"
  #config.vm.network "forwarded_port", guest: 4000, host: 4000

  config.vm.provision "shell", inline: <<-SHELL
    # yarn
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

    # nodejs 10
    curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -

    sudo apt-get install -y \
      nodejs \
      software-properties-common \
      python-software-properties \
      python3-venv python3-pip \
      yarn

    # serverless
    pip3 install awscli --upgrade --user
    yarn global add serverless

    # app
    cd /vagrant && yarn install
  SHELL
end
