import os
from shutil import copyfile
# os.path.isdir(d)

text_file = open("files.txt", "r")
lines = text_file.readlines()
for line in lines:

    if os.path.isfile(line[:-1]):

        src = line[:-1]
        # if not os.path.exists(os.path.dirname(src)):
        #     print src
        #     try:
        #         os.makedirs(os.path.dirname(src))
        #     except:
        #         pass
        dst = "../fs2/" + line[:-1]
        try:
            copyfile(src, dst)
        except:
            print dst

text_file.close()
