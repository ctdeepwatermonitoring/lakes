prj_fp <- getwd()
setwd('..')


lw_rpt_path <- ('ctlakewatch/reports')
lp_rpt_path <- ('lakeprofileReports/reports')

lw <- data.frame(list.files(lw_rpt_path, pattern = "\\.html$", 
                            ignore.case = TRUE))
colnames(lw) <- "lfile"
lw$type <- "VOL"
lw$comID <- sub("\\..*", "", lw$lfile)

lp <- data.frame(list.files(lp_rpt_path, 
                            pattern = "\\.html$", ignore.case = TRUE))
colnames(lp) <- "lfile"
lp$type  <- "ABM"
lp$comID <- sub("\\..*", "", lp$lfile)
lp$comID <- sub(".*_","",lp$comID)

lake_rpts <- rbind(lw, lp)
lake_rpts$comIDck <- substr(lake_rpts$comID, 1, 1)
rpts_keep <- as.numeric(unique(lake_rpts$comIDck))
lake_rpts <- lake_rpts[lake_rpts$comIDck %in% rpts_keep,]
lake_rpts <- lake_rpts[ ,1:3]

lake_rpts <- reshape(lake_rpts, idvar = "comID", 
                     timevar = "type", direction = "wide")

write.csv(lake_rpts, paste0(prj_fp, "/data/available_lake_rpts.csv"),
                            row.names=FALSE)

####Rename lakeprofile files to comID only###############################
setwd("")
file_list <- list.files(pattern = "\\.html$", ignore.case = TRUE)
file.rename(file_list,sub(".*_","",file_list))






