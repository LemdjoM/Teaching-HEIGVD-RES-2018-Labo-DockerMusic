FROM node:8.11.1
MAINTAINER Marie Lemdjo <marie.lemdjonzinke@heig-vd.ch>

#
# When we build the image, we copy the executable jar in the image file system. 
#
ADD src /opt/app/

WORKDIR /opt/app/
RUN npm install

ENTRYPOINT ["node", "/opt/app/auditor.js"]
